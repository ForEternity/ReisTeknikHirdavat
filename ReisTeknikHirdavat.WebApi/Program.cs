using Microsoft.EntityFrameworkCore;
using ReisTeknikHirdavat.Application.Interfaces;
using ReisTeknikHirdavat.Infrastructure.BackgroundServices;
using ReisTeknikHirdavat.Infrastructure.Services;
using ReisTeknikHirdavat.Persistence.Context;

var builder = WebApplication.CreateBuilder(args);

// DbContext Bağlantısı
// DbContext'i interface olarak da kaydet
builder.Services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

// MediatR Kaydı (.NET 10 standardı - Application projesini taratıyoruz)
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(IApplicationDbContext).Assembly));

// Servis Kayıtları (Dependency Injection)
builder.Services.AddHttpClient();
builder.Services.AddScoped<IMarketplaceService, TrendyolIntegrationService>();

builder.Services.AddScoped<IPaymentService, PayTrPaymentService>();
builder.Services.AddHostedService<MarketplaceOrderWorker>();

// Lovable Frontend'in API'ye erişebilmesi için CORS Politikası (Production'da domaine daraltılacak)
// Program.cs içerisindeki builder.Services.AddCors bloğunu şu şekilde güncelle:
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

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles; // İlişkisel tabloların (Product-Image) sonsuz döngüye girmesini engeller.
    });
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

app.UseCors("AllowLovable");


app.UseAuthorization();
app.MapControllers();

app.Run();