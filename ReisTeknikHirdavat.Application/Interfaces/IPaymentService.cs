using ReisTeknikHirdavat.Domain.Entities;

namespace ReisTeknikHirdavat.Application.Interfaces;

public interface IPaymentService
{
    Task<string> GeneratePaymentTokenAsync(Order order, string callbackUrl, string userIp);
    bool ValidateCallbackRequest(Dictionary<string, string> postParams, string merchantKey, string merchantSalt);
}