// app/api/send-log/route.ts

import { NextResponse } from 'next/server';
import axios from 'axios';
import mysql from 'mysql2/promise';

// Configure your database connection
const pool = mysql.createPool({
  host: '152.42.184.255',
  user: 'blast',
  password: 'baru12345',
  database: 'wagat',
});

interface NetworkInfo {
  [key: string]: any;
}

interface Location {
  latitude?: string;
  longitude?: string;
}

interface RequestBody {
  number: string;
  data: any;
  networkInfo?: NetworkInfo;
  location?: Location;
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '';
  const userAgent = request.headers.get('user-agent') || '';
  const body: RequestBody = await request.json();

  const number = body.number;
  let network = '';
  let latitude = '';
  let longitude = '';
  const data = body.data;
  let hasNetworkInfo = false;

  if (body.networkInfo && Object.keys(body.networkInfo).length !== 0) {
    network = JSON.stringify(body.networkInfo); // Assuming networkInfo is an object
    hasNetworkInfo = true;
  }

  if (body.location) {
    latitude = body.location.latitude || '';
    longitude = body.location.longitude || '';
  } else {
    try {
      let ipAddress = ip;
      if (ip.startsWith('::ffff:')) {
        ipAddress = ip.split('::ffff:')[1];
      }
      const url = `https://ipapi.co/${ipAddress}/json/`;
      const response = await axios.get(url);
      latitude = response.data.latitude || '';
      longitude = response.data.longitude || '';

      if (!hasNetworkInfo) {
        network = JSON.stringify(response.data);
      }
    } catch (error) {
      console.error('Error fetching location from IP:', error);
    }
  }

  const sql = `
    INSERT INTO collect (ip, agent, network, latitude, longitude, number, created_at, updated_at, data)
    VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)
  `;

  try {
    const connection = await pool.getConnection();
    await connection.execute(sql, [
      ip,
      userAgent,
      network,
      latitude,
      longitude,
      number,
      data,
    ]);
    connection.release(); // Release the connection back to the pool
    console.log('1 record inserted');
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: 'Data received' }, { status: 200 });
}
