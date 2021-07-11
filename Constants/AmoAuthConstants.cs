using System;
using AmoLeadManagementApi.Models;

namespace AmoLeadManagementApi.Constants {
  public static class AmoAuthConstants {
    private static string Get(string envVar) {
      var envVarValue = Environment.GetEnvironmentVariable(envVar);
      Console.WriteLine($"{envVar}: {envVarValue}");

      return envVarValue;
    }
    
    public static AmoAuth Credentials => new AmoAuth {
      Domain = Get("AMO_DOMAIN"),
      UserHash = Get("AMO_HASH"),
      UserLogin = Get("AMO_LOGIN")
    };
  }
}