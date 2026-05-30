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
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// SONRA: Interface çağrıldığında yukarıda kaydettiğimiz somut sınıfı vermesini söylüyyoruz
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
            "https://reisteknik-frontend.vercel.app", // Vercel dağıtım URL'si
                "https://reisteknik.com",   
                "https://www.reisteknik.com",
                "http://localhost:5000",   // Yerel API test ortamı
                "http://localhost:5173",   // Vite standart portu
                "http://localhost:8080"    // Lovable / TanStack Start yerel portu
              )
              .SetIsOriginAllowed(origin => origin.EndsWith(".vercel.app")) // İŞTE SİHİRLİ DOKUNUŞ!
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

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var dbContext = services.GetRequiredService<ApplicationDbContext>();
        // Veritabanı yoksa oluşturur ve bekleyen tüm migration'ları tıkır tıkır basar
        dbContext.Database.Migrate();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Veritabanı migration işlemi esnasında sinsi bir hata oluştu!");
    }
}


app.Run();