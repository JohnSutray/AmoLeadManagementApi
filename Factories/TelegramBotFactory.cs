using System;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Telegram.Bot;

namespace AmoLeadManagementApi.Factories {
  public class TelegramBotFactory {
    public static ITelegramBotClient Create(IServiceProvider provider) {
      var token = provider.GetRequiredService<IHostEnvironment>().IsDevelopment()
        ? provider.GetRequiredService<IConfiguration>().GetSection("Telegram")["Token"]
        : Environment.GetEnvironmentVariable("TELEGRAM_TOKEN");

      return new TelegramBotClient(token);;
    }
  }
}
