package com.groupxx.smartcampus.auth.dto;

import jakarta.validation.constraints.NotBlank;
public class TwoFactorVerifyRequest {
    @NotBlank
    private String challengeId;

    @NotBlank
    private String code;

    public TwoFactorVerifyRequest() {
    }

    public TwoFactorVerifyRequest(String challengeId, String code) {
        this.challengeId = challengeId;
        this.code = code;
    }

    public String getChallengeId() {
        return challengeId;
    }

    public void setChallengeId(String challengeId) {
        this.challengeId = challengeId;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
