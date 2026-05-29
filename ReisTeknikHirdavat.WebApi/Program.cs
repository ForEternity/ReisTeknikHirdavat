using Microsoft.EntityFrameworkCore;
using ReisTeknikHirdavat.Application.Interfaces;
using ReisTeknikHirdavat.Infrastructure.BackgroundServices;
using ReisTeknikHirdavat.Infrastructure.Services;
using ReisTeknikHirdavat.Persistence.Context;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. VERİTABANI VE CONTEXT KAYITLARI (DOĞRU SIRALAMA)
// ==========================================

// ÖNCE: Somut sınıfı (ApplicationDbContext) veritabanı bağlantısıyla kaydediyoruz
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// SONRA: Interface çağrıldığında yukarıda kaydettiğimiz somut sınıfı vermesini söylüyoruz
builder.Services.AddScoped<IApplicationDbContext>(provider =>
    provider.GetRequiredService<ApplicationDbContext>());


// ==========================================
// 2. MEDIATR VE SERVİS KAYITLARI
// ==========================================

// MediatR Kaydı (.NET 10 standardı - Application projesini taratıyoruz)
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(IApplicationDbContext).Assembly));

builder.Services.AddHttpClient();
builder.Services.AddScoped<IMarketplaceService, TrendyolIntegrationService>();
builder.Services.AddScoped<IPaymentService, PayTrPaymentService>();
builder.Services.AddHostedService<MarketplaceOrderWorker>();


// ==========================================
// 3. CORS VE HTTP GÜVENLİK POLİTİKALARI
// ==========================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLovable", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5000",   // Yerel test ortamı
                "http://localhost:5173",   // Vite/React varsayılan portu
                "https://lovable.dev",     // Lovable ana platformu
                "https://reisteknik.com"   // Canlı domain (Production)
              )
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Güvenli çerez ve JWT geçişleri için şart
    });
});


// ==========================================
// 4. KONTROLÖRLER VE JSON YAPILANDIRMASI
// ==========================================
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles; // Sonsuz döngü engelleme
    });

builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

// ==========================================
// 5. MIDDLEWARE HATTI (ÇALIŞMA SIRASI)
// ==========================================
app.UseCors("AllowLovable");
app.UseAuthorization();
app.MapControllers();

app.Run();