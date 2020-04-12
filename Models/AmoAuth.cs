﻿namespace AmoLeadManagementApi.Models {
  public class AmoAuth {
    public string Domain { get; set; }
    public string UserLogin { get; set; }
    public string UserHash { get; set; }

    public object ToDto() => new {
      USER_LOGIN = UserLogin,
      USER_HASH = UserHash
    };
  }
}