using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;
using ReisTeknikHirdavat.Application.Interfaces;
using ReisTeknikHirdavat.Domain.Entities;

namespace ReisTeknikHirdavat.Infrastructure.Services;

public class TrendyolIntegrationService : IMarketplaceService
{
    private readonly IHttpClientFactory _httpClientFactory;

    public TrendyolIntegrationService(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    /// <summary>
    /// Trendyol Satıcı Panelindeki Tüm Ürünleri Çeker ve Lokal Nesneye Dönüştürür.
    /// </summary>
    public async Task<List<Product>> FetchProductsFromTrendyolAsync(string apiKey, string apiSecret, string supplierId)
    {
        var client = _httpClientFactory.CreateClient();
        var url = $"https://api.trendyol.com/sapigw/suppliers/{supplierId}/products";

        var authToken = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{apiKey}:{apiSecret}"));
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authToken);
        client.DefaultRequestHeaders.Add("User-Agent", $"{supplierId} - ReisTeknikIntegration");

        var response = await client.GetAsync(url);
        if (!response.IsSuccessStatusCode)
            throw new Exception($"Trendyol Ürün API Hatası: {response.StatusCode}");

        var content = await response.Content.ReadFromJsonAsync<TrendyolProductResponse>();
        var products = new List<Product>();

        if (content?.Content != null)
        {
            foreach (var item in content.Content)
            {
                products.Add(new Product
                {
                    Name = item.Title,
                    Sku = item.StockCode,
                    Barcode = item.Barcode,
                    Price = item.ListPrice,
                    DiscountPrice = item.SalePrice,
                    LocalStock = item.Quantity,
                    TrendyolStock = item.Quantity,
                    TrendyolProductCode = item.Id,
                    IsSyncWithTrendyol = true,
                    Images = item.Images.Select(img => new ProductImage { ImageUrl = img.Url }).ToList()
                });
            }
        }
        return products;
    }

    /// <summary>
    /// Trendyol Üzerinde Belirli Bir Tarihten Sonra Gelen Yeni Siparişleri Çeker.
    /// </summary>
    public async Task<List<Order>> FetchOrdersFromTrendyolAsync(string apiKey, string apiSecret, string supplierId, DateTime startDate)
    {
        var client = _httpClientFactory.CreateClient();
        // Trendyol API epoch milisaniye cinsinden zaman damgası bekler
        var timestamp = new DateTimeOffset(startDate).ToUnixTimeMilliseconds();
        var url = $"https://api.trendyol.com/sapigw/suppliers/{supplierId}/orders?startDate={timestamp}";

        var authToken = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{apiKey}:{apiSecret}"));
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authToken);
        client.DefaultRequestHeaders.Add("User-Agent", $"{supplierId} - ReisTeknikIntegration");

        var response = await client.GetAsync(url);
        if (!response.IsSuccessStatusCode) return new List<Order>();

        var content = await response.Content.ReadFromJsonAsync<TrendyolOrderResponse>();
        var orders = new List<Order>();

        if (content?.Content != null)
        {
            foreach (var tOrder in content.Content)
            {
                var order = new Order
                {
                    OrderNumber = tOrder.OrderNumber,
                    CustomerName = $"{tOrder.CustomerFirstName} {tOrder.CustomerLastName}",
                    Email = tOrder.CustomerEmail ?? "trendyol@reisteknik.com",
                    PhoneNumber = tOrder.CustomerPhone ?? string.Empty,
                    ShippingAddress = tOrder.ShippingAddress?.FullAddress ?? "Trendyol Adresi",
                    BillingAddress = tOrder.BillingAddress?.FullAddress ?? "Trendyol Adresi",
                    Source = Domain.Enums.OrderSource.Trendyol,
                    Status = Domain.Enums.OrderStatus.New,
                    TotalAmount = tOrder.TotalPrice,
                    KvkkApproved = true, // Pazaryeri kuralları gereği onaylı kabul edilir
                    MssApproved = true,
                    UserIpAddress = "127.0.0.1"
                };

                if (tOrder.Lines != null)
                {
                    foreach (var tLine in tOrder.Lines)
                    {
                        order.OrderItems.Add(new OrderItem
                        {
                            ProductName = tLine.ProductName,
                            Sku = tLine.MerchantSku,
                            Quantity = tLine.Quantity,
                            Price = tLine.Price
                        });
                    }
                }
                orders.Add(order);
            }
        }
        return orders;
    }

    public Task<bool> UpdateStockAsync(string apiKey, string apiSecret, string supplierId, string barcode, int newStock)
    {
        // TODO: Trendyol tekli/toplu stok güncelleme entegrasyonu (A2 paket yükü)
        throw new NotImplementedException();
    }

    public Task<bool> UpdatePriceAsync(string apiKey, string apiSecret, string supplierId, string barcode, decimal newPrice)
    {
        // TODO: Trendyol fiyat güncelleme entegrasyonu
        throw new NotImplementedException();
    }
}

#region Trendyol Ürün API JSON Eşleştirme Sınıfları
public class TrendyolProductResponse { public List<TrendyolProductItem>? Content { get; set; } }
public class TrendyolProductItem
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string StockCode { get; set; } = string.Empty;
    public string Barcode { get; set; } = string.Empty;
    public decimal ListPrice { get; set; }
    public decimal SalePrice { get; set; }
    public int Quantity { get; set; }
    public List<TrendyolImageItem> Images { get; set; } = new();
}
public class TrendyolImageItem { public string Url { get; set; } = string.Empty; }
#endregion

#region Trendyol Sipariş API JSON Eşleştirme Sınıfları
public class TrendyolOrderResponse { public List<TrendyolOrderItem>? Content { get; set; } }
public class TrendyolOrderItem
{
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerFirstName { get; set; } = string.Empty;
    public string CustomerLastName { get; set; } = string.Empty;
    public string? CustomerEmail { get; set; }
    public string? CustomerPhone { get; set; }
    public decimal TotalPrice { get; set; }
    public TrendyolAddress? ShippingAddress { get; set; }
    public TrendyolAddress? BillingAddress { get; set; }
    public List<TrendyolOrderLine> Lines { get; set; } = new();
}
public class TrendyolAddress { public string FullAddress { get; set; } = string.Empty; }
public class TrendyolOrderLine
{
    public string ProductName { get; set; } = string.Empty;
    public string MerchantSku { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}
#endregion