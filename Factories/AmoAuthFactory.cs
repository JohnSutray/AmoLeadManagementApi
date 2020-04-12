using System;
using AmoLeadManagementApi.Models;
using AmoLeadManagementApi.Extensions.Configuration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AmoLeadManagementApi.Factories {
  public class AmoAuthFactory {
    public static AmoAuth Create(IServiceProvider provider) {
      var configuration = provider.GetRequiredService<IConfiguration>();
      
      return new AmoAuth {
        Domain = configuration.GetAmoDomain(),
        UserHash = configuration.GetAmoHash(),
        UserLogin = configuration.GetAmoLogin()
      };
    }
  }
}