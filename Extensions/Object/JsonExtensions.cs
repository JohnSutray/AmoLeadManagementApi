﻿using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace ConsoleApp1 {
  public static class JsonExtensions {
    public static string ToJson(this object value) => JsonConvert.SerializeObject(value);

    public static JObject ToJObject(this string json) => JObject.Parse(json);

    public static object ToAddDto(this object entity) => new {add = new[] {entity}};
  }
}