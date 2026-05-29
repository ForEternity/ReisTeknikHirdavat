namespace ReisTeknikHirdavat.Domain.Enums;

public enum OrderStatus
{
    New = 1,          // Yeni Sipariş
    Preparing = 2,    // Hazırlanıyor
    Shipped = 3,      // Kargoya Verildi
    Delivered = 4,    // Teslim Edildi
    Cancelled = 5     // İptal Edildi
}