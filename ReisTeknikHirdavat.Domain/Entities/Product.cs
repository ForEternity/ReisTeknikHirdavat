using ReisTeknikHirdavat.Domain.Common;

namespace ReisTeknikHirdavat.Domain.Entities;

public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty; // Stok Kodu
    public string Barcode { get; set; } = string.Empty; // Barkod (Trendyol eşleştirmesi için)
    public string? Description { get; set; }

    // Fiyatlandırma
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }

    // Stok Yönetimi
    public int LocalStock { get; set; }
    public int TrendyolStock { get; set; }
    public int CriticalStockLevel { get; set; } = 5;

    // Pazar Yeri Entegrasyon Bilgileri
    public string? TrendyolProductCode { get; set; }
    public bool IsSyncWithTrendyol { get; set; } = false;

    // Hatanın Çözümü: Ef Core İlişkisi İçin Sınıf İçinde Koleksiyon Tanımı
    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
}

public class ProductImage : BaseEntity
{
    public Guid ProductId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsMain { get; set; } = false;
}