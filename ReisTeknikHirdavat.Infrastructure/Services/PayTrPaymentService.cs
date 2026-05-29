using System.Security.Cryptography;
using System.Text;
using ReisTeknikHirdavat.Application.Interfaces;
using ReisTeknikHirdavat.Domain.Entities;

namespace ReisTeknikHirdavat.Infrastructure.Services;

public class PayTrPaymentService : IPaymentService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private const string MerchantId = "TEST_MERCHANT_ID"; // Production'da appsettings'den okunacak
    private const string MerchantKey = "TEST_MERCHANT_KEY";
    private const string MerchantSalt = "TEST_MERCHANT_SALT";

    public PayTrPaymentService(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public async Task<string> GeneratePaymentTokenAsync(Order order, string callbackUrl, string userIp)
    {
        var client = _httpClientFactory.CreateClient();

        // PayTR kurallarına göre kuruş hesabı (Örn: 100 TL için 10000 gönderilmeli)
        var paymentAmount = (int)(order.TotalAmount * 100);

        // Benzersiz sepet içeriği oluşturma (PayTR formatı: [["Ürün Adı", "Fiyat", Adet]])
        var basketItems = order.OrderItems.Select(item => new object[] { item.ProductName, (item.Price * 100).ToString("0"), item.Quantity }).ToList();
        var userBasket = System.Text.Json.JsonSerializer.Serialize(basketItems);
        var userBasketBase64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(userBasket));

        // PayTR Hash Token oluşturma algoritması (Sıralama kritiktir!)
        string hashStr = MerchantId + userIp + order.OrderNumber + order.Email + paymentAmount.ToString() + userBasketBase64 + "0" + "0" + "TL" + "0";
        var token = BirlestirVeHashle(hashStr, MerchantSalt, MerchantKey);

        var requestData = new Dictionary<string, string>
        {
            {"merchant_id", MerchantId},
            {"user_ip", userIp},
            {"merchant_oid", order.OrderNumber},
            {"email", order.Email},
            {"payment_amount", paymentAmount.ToString()},
            {"paytr_token", token},
            {"user_basket", userBasketBase64},
            {"debug_on", "1"}, // Test ortamı için 1, canlı için 0
            {"no_installment", "0"}, // Taksit seçenekleri açık
            {"max_installment", "12"},
            {"user_name", order.CustomerName},
            {"user_address", order.ShippingAddress},
            {"user_phone", order.PhoneNumber},
            {"merchant_ok_url", callbackUrl},
            {"merchant_fail_url", callbackUrl},
            {"currency", "TL"},
            {"test_mode", "1"} // Test modu açık
        };

        var content = new FormUrlEncodedContent(requestData);
        var response = await client.PostAsync("https://www.paytr.com/odeme/api/get-token", content);

        var responseString = await response.Content.ReadAsStringAsync();
        // Gelen yanıt örn: {"status":"success","token":"XXXXX"} biçimindedir. Production'da parse edilmeli.
        return responseString;
    }

    public bool ValidateCallbackRequest(Dictionary<string, string> postParams, string merchantKey, string merchantSalt)
    {
        // PayTR'dan gelen bildirim verisinin doğruluğunu teyit etme
        string generatedHashStr = postParams["merchant_oid"] + merchantSalt + postParams["status"] + postParams["total_amount"];
        var expectedHash = BirlestirVeHashle(generatedHashStr, "", merchantKey);

        return postParams["hash"] == expectedHash;
    }

    private string BirlestirVeHashle(string baseStr, string salt, string key)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
        byte[] bStr = Encoding.UTF8.GetBytes(baseStr + salt);
        byte[] hashBytes = hmac.ComputeHash(bStr);
        return Convert.ToBase64String(hashBytes);
    }
}