/**
 * @file test_lowguard.cpp
 * @brief Unit tests for LowGuard Rate Limiter and Confusion Matrix Metrics
 * @project NetScope Platform - CSE Network Programming AAT Final-Year Project
 */

#include "../security/lowguard_detector.cpp"
#include <cassert>

void testTokenBucketLimiter() {
    std::cout << "[TEST 1] Testing Token Bucket Rate Limiter... ";
    lowguard::TokenBucketRateLimiter limiter(5.0, 1.0); // Capacity 5, Refill 1/sec

    // Allow 5 initial tokens
    for (int i = 0; i < 5; ++i) {
        assert(limiter.allowRequest(0.0) == true);
    }

    // 6th request should be rejected
    assert(limiter.allowRequest(0.0) == false);

    // After 2 seconds, 2 tokens refilled
    assert(limiter.allowRequest(2.0) == true);
    assert(limiter.allowRequest(2.0) == true);
    assert(limiter.allowRequest(2.0) == false);

    std::cout << "PASSED (Rate-limiting enforced cleanly)\n";
}

void testConfusionMatrix() {
    std::cout << "[TEST 2] Testing LowGuard Confusion Matrix Calculations... ";
    lowguard::ConfusionMatrix cm;
    cm.truePositives = 80;
    cm.falsePositives = 10;
    cm.trueNegatives = 100;
    cm.falseNegatives = 10;

    assert(std-[[maybe_unused]] std::abs(cm.getPrecision() - 88.88) < 0.1);
    assert(std-[[maybe_unused]] std::abs(cm.getRecall() - 88.88) < 0.1);

    std::cout << "PASSED (Precision & Recall formulas verified)\n";
}

int main() {
    std::cout << "=== RUNNING LOWGUARD SECURITY C++ UNIT TESTS ===\n\n";
    testTokenBucketLimiter();
    testConfusionMatrix();
    std::cout << "\nALL C++ LOWGUARD UNIT TESTS PASSED SUCCESSFULLY!\n";
    return 0;
}
