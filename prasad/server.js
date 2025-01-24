const express = require('express');
const requestIp = require('request-ip');
const useragent = require('useragent');
const useragentExpress = require('express-useragent');
const speedtest = require('speedtest-net');

const app = express();

// Middleware to capture IP address
app.use(requestIp.mw());

// Middleware to detect the system type using user-agent
app.use(useragentExpress.express());

// Route to capture system info and display it
app.get('/', async (req, res) => {
  // Capturing IP address
  const ip = req.clientIp;
  
  // Capturing system info (User Agent)
  const agent = useragent.parse(req.headers['user-agent']);
  const systemType = agent.os.toString();
  const device = agent.device.toString();
  
  // Detecting bot (based on user-agent)
  const isBot = req.useragent.isBot;
  
  // Get external devices (Basic check from user agent, could be expanded)
  let externalDevices = "Not Detected";  // You'd need more specific client-side code for device detection
  
  // Capture internet speed (download/upload in Mbps)
  try {
    const speed = await getInternetSpeed();
    const speedInfo = {
      download: speed.download,
      upload: speed.upload
    };
    
    // Respond with system information and internet speed
    res.json({
      ip: ip,
      systemType: systemType,
      device: device,
      externalDevices: externalDevices,
      isBot: isBot,
      internetSpeed: speedInfo
    });
    
  } catch (error) {
    // In case of any issues with the speed test
    res.status(500).json({ error: "Failed to detect internet speed." });
  }
});

// Function to check internet speed using speedtest
function getInternetSpeed() {
  return new Promise((resolve, reject) => {
    const test = speedtest({ acceptLicense: true, acceptGdpr: true });
    
    test.on('data', data => {
      resolve({
        download: (data.speeds.download / 1000000).toFixed(2),  // Convert to Mbps
        upload: (data.speeds.upload / 1000000).toFixed(2)     // Convert to Mbps
      });
    });
    
    test.on('error', err => reject(err));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
