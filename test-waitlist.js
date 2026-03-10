// Test script for waitlist API
// Run with: node test-waitlist.js

const testEmail = "test@example.com";
const apiUrl = "http://localhost:3000/api/waitlist";

async function testWaitlist() {
  console.log("🧪 Testing Waitlist API...\n");
  console.log(`📧 Testing with email: ${testEmail}`);
  console.log(`🌐 API URL: ${apiUrl}\n`);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: testEmail }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ SUCCESS!");
      console.log("Response:", JSON.stringify(data, null, 2));
      console.log("\n📬 Check your email and admin emails!");
      console.log("🗄️  Check Supabase waitlist table for the entry");
    } else {
      console.log("❌ ERROR!");
      console.log("Status:", response.status);
      console.log("Response:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("❌ NETWORK ERROR:", error.message);
    console.log("\n💡 Make sure your dev server is running:");
    console.log("   npm run dev");
  }
}

testWaitlist();
