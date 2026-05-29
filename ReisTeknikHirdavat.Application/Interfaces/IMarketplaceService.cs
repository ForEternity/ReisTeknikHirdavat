using ReisTeknikHirdavat.Domain.Entities;

namespace ReisTeknikHirdavat.Application.Interfaces;

public interface IMarketplaceService
{
    Task<List<Product>> FetchProductsFromTrendyolAsync(string apiKey, string apiSecret, string supplierId);
    Task<bool> UpdateStockAsync(string apiKey, string apiSecret, string supplierId, string barcode, int newStock);
    Task<bool> UpdatePriceAsync(string apiKey, string apiSecret, string supplierId, string barcode, decimal newPrice);
    Task<List<Order>> FetchOrdersFromTrendyolAsync(string apiKey, string apiSecret, string supplierId, DateTime startDate);
}