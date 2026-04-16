package com.groupxx.smartcampus.auth.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TwoFactorChallengeResponse {
    private String challengeId;
    private String message;
}
