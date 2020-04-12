﻿namespace AmoLeadManagementApi.Models.Fields {
  public class CustomField {
    public int Id { get; set; }
    public string Code { get;set; }
    public string Value { get; set; }
    public int Enum { get; set; }
    public bool IsSystem { get; set; }

    public object ToDto() => new {
      id = Id,
      is_system = IsSystem,
      code = Code,
      values = new[] {
        new {
          value = Value,
          @enum = Enum,
        }
      },
    };
  }
}