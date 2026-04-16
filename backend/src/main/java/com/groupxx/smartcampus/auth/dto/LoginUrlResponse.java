package com.groupxx.smartcampus.auth.dto;

public class LoginUrlResponse {
    private String url;

    public LoginUrlResponse() {
    }

    public LoginUrlResponse(String url) {
        this.url = url;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}
