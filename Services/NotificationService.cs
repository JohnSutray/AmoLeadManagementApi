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
      ITelegramBotClient client, IConfiguration configuration, IHostEnvironment environment
    ) {
      _client = client;
      _configuration = configuration;
      _environment = environment;
    }

    private DateTime Now => DateTime.Now.AddHours(3);

    public async Task NotifyStart(string clientName, string additionalInfo) =>
      await SendNotification($"{clientName}\n\n{additionalInfo}");

    private async Task<Message[]> SendNotification(string notification) => await Task.WhenAll(
      Receivers.Select(receiver => _client.SendTextMessageAsync(int.Parse(receiver), notification))
    );

    private string[] Receivers => _environment.IsDevelopment()
      ? _configuration.GetSection("Telegram")["Receivers"].Split(";")
      : Environment.GetEnvironmentVariable("TELEGRAM_RECEIVERS").Split(";");


    public async Task<Message[]> Notify(
      CreateLeadDto dto, AmoResult contactResult, AmoResult leadResult
    ) => await SendNotification(
      $"Contact ID: {dto.Id}\n" +
      $"ContactName: {dto.ContactName}\n" +
      $"LeadName: {dto.LeadName}\n" +
      $"Phone: {dto.Phone}\n" +
      $"Info: {dto.Info}\n" +
      $"Date: {Now.ToLongDateString()}\n" +
      $"Time: {Now.ToLongTimeString()}\n" +
      $"Lead request: {leadResult.ResponseCode}\n" +
      $"Contact result: {contactResult.ResponseCode}"
    );
  }
}
