/**
 * @file lowguard_detector.cpp
 * @brief LowGuard Lightweight Network Flood Detection & Rate-Limiter Core
 * @project NetScope Platform - CSE Network Programming AAT Final-Year Project
 */

#include <iostream>
#include <vector>
#include <string>
#include <chrono>
#include <cmath>

namespace lowguard {

struct ConfusionMatrix {
    int truePositives = 0;   // Correctly detected attack bursts
    int falsePositives = 0;  // Normal traffic flagged as attack
    int trueNegatives = 0;   // Correctly identified normal traffic
    int falseNegatives = 0;  // Undetected attack bursts

    double getPrecision() const {
        int denom = truePositives + falsePositives;
        return denom > 0 ? (static_cast<double>(truePositives) / denom * 100.0) : 0.0;
    }

    double getRecall() const {
        int denom = truePositives + falseNegatives;
        return denom > 0 ? (static_cast<double>(truePositives) / denom * 100.0) : 0.0;
    }

    double getF1Score() const {
        double p = getPrecision();
        double r = getRecall();
        return (p + r) > 0 ? (2.0 * p * r / (p + r)) : 0.0;
    }
};

class TokenBucketRateLimiter {
private:
    double capacity;
    double tokens;
    double refillRateTokensPerSec;
    double lastRefillTimeSec;

public:
    TokenBucketRateLimiter(double cap = 50.0, double rate = 10.0)
        : capacity(cap), tokens(cap), refillRateTokensPerSec(rate), lastRefillTimeSec(0.0) {}

    bool allowRequest(double currentTimeSec, double cost = 1.0) {
        double delta = currentTimeSec - lastRefillTimeSec;
        lastRefillTimeSec = currentTimeSec;

        tokens = std::min(capacity, tokens + delta * refillRateTokensPerSec);

        if (tokens >= cost) {
            tokens -= cost;
            return true; // Accepted
        }
        return false; // Rate-limited / Rejected
    }
};

} // namespace lowguard
