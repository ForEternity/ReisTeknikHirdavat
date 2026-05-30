using Microsoft.EntityFrameworkCore;
using ReisTeknikHirdavat.Application.Interfaces;
using ReisTeknikHirdavat.Infrastructure.BackgroundServices;
using ReisTeknikHirdavat.Infrastructure.Services;
using ReisTeknikHirdavat.Persistence.Context;
using ReisTeknikHirdavat.Application.Features.Orders.Queries.GetAdminDashboard; // Dashboard ve MediatR referansları için



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
    options.AddPolicy("frontend", policy =>
    {
        policy.WithOrigins(
                "https://reis-teknik-hirdavat.vercel.app",
                "https://reis-teknik-hirdavat-foreternitys-projects.vercel.app",
                "https://reisteknik.com",
                "https://www.reisteknik.com",
                "http://localhost:5000",   // Yerel API test ortamı
                "http://localhost:5173",   // Vite standart portu
                "http://localhost:8080"    // Lovable / TanStack Start yerel portu (İŞTE BURASI!)
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
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
app.UseCors("frontend");

app.UseAuthorization();
app.MapControllers();

app.Run();