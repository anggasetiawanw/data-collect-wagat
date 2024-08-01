// global.d.ts
interface NavigatorConnection {
  downlink: number;
  effectiveType: string;
  rtt: number;
  saveData: boolean;
}

interface Navigator {
  connection?: NavigatorConnection;
}
