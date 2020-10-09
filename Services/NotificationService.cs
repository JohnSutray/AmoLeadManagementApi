using System;
using System.Linq;
using System.Threading.Tasks;
using AmoLeadManagementApi.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Telegram.Bot;
using Telegram.Bot.Types;

namespace AmoLeadManagementApi.Services {
  public class NotificationService {
    private readonly ITelegramBotClient _client;
    private readonly IConfiguration _configuration;
    private readonly IHostEnvironment _environment;

    public NotificationService(
      ITelegramBotClient client,
      IConfiguration configuration,
      IHostEnvironment environment
    ) {
      _client = client;
      _configuration = configuration;
      _environment = environment;
    }

    public async Task<Message[]> Notify(
      CreateLeadDto dto,
      AmoResult contactResult,
      AmoResult leadResult
    ) {
      var receiversString = _environment.IsDevelopment()
        ? _configuration.GetSection("Telegram")["Receivers"]
        : Environment.GetEnvironmentVariable("TELEGRAM_RECEIVERS");
      var receivers = receiversString.Split(";");
      var time = DateTime.Now.AddHours(3);
      var notification = $"ContactName: {dto.ContactName}\n" +
                         $"LeadName: {dto.LeadName}\n" +
                         $"Phone: {dto.Phone}\n" +
                         $"Info: {dto.Info}\n" +
                         $"Date: {time.ToLongDateString()}\n" +
                         $"Time: {time.ToLongTimeString()}\n" +
                         "Lead request:\n" +
                         leadResult.ResponseJson +
                         "\nContact result:\n" +
                         contactResult.ResponseJson;

      return await Task.WhenAll(
        receivers.Select(
          receiver => _client.SendTextMessageAsync(int.Parse(receiver), notification)
        )
      );
    }
  }
}
