using System;
using AmoLeadManagementApi.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace AmoLeadManagementApi.Factories {
  public class AmoAuthFactory {
    public static AmoAuth Create(IServiceProvider provider) =>
      provider.GetRequiredService<IHostEnvironment>().IsDevelopment()
        ? AmoAuthFromConfiguration(provider.GetRequiredService<IConfiguration>())
        : AmoAuthFromEnv;

    private static AmoAuth AmoAuthFromEnv => new AmoAuth {
      Domain = Environment.GetEnvironmentVariable("AMO_DOMAIN"),
      UserHash = Environment.GetEnvironmentVariable("AMO_HASH"),
      UserLogin = Environment.GetEnvironmentVariable("AMO_LOGIN")
    };

    private static AmoAuth AmoAuthFromConfiguration(IConfiguration configuration) {
      var amo = configuration.GetSection("Amo");

      return new AmoAuth {
        Domain = amo["Domain"],
        UserHash = amo["Hash"],
        UserLogin = amo["Login"]
      };
    }
  }
}
