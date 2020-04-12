using Microsoft.Extensions.Configuration;

namespace AmoLeadManagementApi.Extensions.Configuration {
  public static class ConfigurationExtensions {
    private static IConfigurationSection GetAmoSection(this IConfiguration configuration) =>
      configuration.GetSection("Amo");

    public static string GetAmoLogin(this IConfiguration configuration) =>
      configuration.GetAmoSection()["Login"];

    public static string GetAmoHash(this IConfiguration configuration) =>
      configuration.GetAmoSection()["Hash"];

    public static string GetAmoDomain(this IConfiguration configuration) =>
      configuration.GetAmoSection()["Domain"];
  }
}