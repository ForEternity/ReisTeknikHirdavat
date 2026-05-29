using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using ReisTeknikHirdavat.Application.Interfaces;

namespace ReisTeknikHirdavat.Infrastructure.BackgroundServices;

// Sınıfın kesinlikle Microsoft.Extensions.Hosting altındaki BackgroundService'den türediğinden emin oluyoruz
public class MarketplaceOrderWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<MarketplaceOrderWorker> _logger;
    private readonly TimeSpan _period = TimeSpan.FromMinutes(5);

    public MarketplaceOrderWorker(IServiceProvider serviceProvider, ILogger<MarketplaceOrderWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Reis Teknik Hırdavat Pazar Yeri Sipariş Takip İşçisi Başlatıldı.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
                    var marketplaceService = scope.ServiceProvider.GetRequiredService<IMarketplaceService>();

                    _logger.LogInformation("Trendyol yeni siparişler kontrol ediliyor...");

                    var checkDate = DateTime.UtcNow.AddHours(-1);

                    var importedOrders = await marketplaceService.FetchOrdersFromTrendyolAsync(
                        "TEST_KEY", "TEST_SECRET", "TEST_SUPPLIER_ID", checkDate);

                    foreach (var order in importedOrders)
                    {
                        var isExist = await context.Orders.AsNoTracking()
                            .AnyAsync(o => o.OrderNumber == order.OrderNumber, stoppingToken);

                        if (!isExist)
                        {
                            await context.Orders.AddAsync(order, stoppingToken);

                            foreach (var item in order.OrderItems)
                            {
                                var product = await context.Products
                                    .FirstOrDefaultAsync(p => p.Sku == item.Sku, stoppingToken);

                                if (product != null)
                                {
                                    product.LocalStock = Math.Max(0, product.LocalStock - item.Quantity);
                                }
                            }

                            _logger.LogInformation($"Trendyol'dan yeni sipariş sisteme aktarıldı: {order.OrderNumber}");
                        }
                    }

                    await context.SaveChangesAsync(stoppingToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Pazar yeri sipariş işçisi hatası: {ex.Message}");
            }

            await Task.Delay(_period, stoppingToken);
        }
    }
}