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
      Domain = "oknaramy",
      UserHash = "f0aaec1a024a566ef6503bf4bdef8bdb940e2de8",
      UserLogin = "7963985@bk.ru"
    };
  }
}