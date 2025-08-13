const axios = require("axios");

const BASE_URL = process.env.TEST_URL || "http://localhost:3001";

const testAuth = async () => {
  console.log("🧪 Testing Authentication System...\n");

  try {
    // Test 1: User Signup
    console.log("1. Testing user signup...");
    const signupData = {
      username: "testuser",
      password: "TestPass123",
    };

    const signupResponse = await axios.post(
      `${BASE_URL}/api/auth/signup`,
      signupData
    );
    console.log("✅ Signup successful:", signupResponse.data);

    // Test 2: User Signin
    console.log("\n2. Testing user signin...");
    const signinData = {
      username: "testuser",
      password: "TestPass123",
    };

    const signinResponse = await axios.post(
      `${BASE_URL}/api/auth/signin`,
      signinData
    );
    console.log("✅ Signin successful:", signinResponse.data);

    // Test 3: Get user files (should be empty initially)
    console.log("\n3. Testing get user files...");
    const filesResponse = await axios.get(`${BASE_URL}/api/files`, {
      params: { username: "testuser" },
    });
    console.log("✅ Get files successful:", filesResponse.data);

    // Test 4: Test invalid credentials
    console.log("\n4. Testing invalid credentials...");
    try {
      await axios.post(`${BASE_URL}/api/auth/signin`, {
        username: "testuser",
        password: "wrongpassword",
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log("✅ Invalid credentials properly rejected");
      } else {
        throw error;
      }
    }

    // Test 5: Test missing username
    console.log("\n5. Testing missing username...");
    try {
      await axios.get(`${BASE_URL}/api/files`);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.log("✅ Missing username properly rejected");
      } else {
        throw error;
      }
    }

    console.log("\n🎉 All authentication tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
    process.exit(1);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  testAuth();
}

module.exports = { testAuth };
