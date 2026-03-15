export type HistoricalWinnerSeed = {
  driver: string;
  constructor: string;
  year: string;
};

export type HistoricalFastestLapSeed = {
  driver: string;
  time: string;
  year: string;
};

export const HISTORICAL_CIRCUIT_STATS: Record<
  string,
  { winner: HistoricalWinnerSeed; fastestLap: HistoricalFastestLapSeed }
> = {
  albert_park: {
    winner: { driver: 'George Russell', constructor: 'Mercedes', year: '2026' },
    fastestLap: { driver: 'Charles Leclerc', time: '1:19.813', year: '2024' }
  },
  jeddah: {
    winner: { driver: 'Oscar Piastri', constructor: 'McLaren', year: '2025' },
    fastestLap: { driver: 'Lewis Hamilton', time: '1:30.734', year: '2021' }
  },
  bahrain: {
    winner: { driver: 'Oscar Piastri', constructor: 'McLaren', year: '2025' },
    fastestLap: { driver: 'George Russell', time: '55.404', year: '2020' }
  },
  suzuka: {
    winner: { driver: 'Max Verstappen', constructor: 'Red Bull', year: '2025' },
    fastestLap: { driver: 'Andrea Kimi Antonelli', time: '1:30.965', year: '2025' }
  },
  shanghai: {
    winner: { driver: 'Andrea Kimi Antonelli', constructor: 'Mercedes', year: '2026' },
    fastestLap: { driver: 'Michael Schumacher', time: '1:32.238', year: '2004' }
  },
  miami: {
    winner: { driver: 'Oscar Piastri', constructor: 'McLaren', year: '2025' },
    fastestLap: { driver: 'Max Verstappen', time: '1:29.708', year: '2023' }
  },
  imola: {
    winner: { driver: 'Max Verstappen', constructor: 'Red Bull', year: '2025' },
    fastestLap: { driver: 'Lewis Hamilton', time: '1:15.484', year: '2020' }
  },
  monaco: {
    winner: { driver: 'Lando Norris', constructor: 'McLaren', year: '2025' },
    fastestLap: { driver: 'Lewis Hamilton', time: '1:12.909', year: '2021' }
  },
  catalunya: {
    winner: { driver: 'Oscar Piastri', constructor: 'McLaren', year: '2025' },
    fastestLap: { driver: 'Giancarlo Fisichella', time: '1:15.641', year: '2005' }
  },
  villeneuve: {
    winner: { driver: 'George Russell', constructor: 'Mercedes', year: '2025' },
    fastestLap: { driver: 'Valtteri Bottas', time: '1:13.078', year: '2019' }
  },
  red_bull_ring: {
    winner: { driver: 'Lando Norris', constructor: 'McLaren', year: '2025' },
    fastestLap: { driver: 'Carlos Sainz', time: '1:05.619', year: '2020' }
  },
  silverstone: {
    winner: { driver: 'Lando Norris', constructor: 'McLaren', year: '2025' },
    fastestLap: { driver: 'Michael Schumacher', time: '1:18.739', year: '2004' }
  },
  spa: {
    winner: { driver: 'Oscar Piastri', constructor: 'McLaren', year: '2025' },
    fastestLap: { driver: 'Sergio Pérez', time: '1:44.701', year: '2024' }
  },
  hungaroring: {
    winner: { driver: 'Lando Norris', constructor: 'McLaren', year: '2025' },
    fastestLap: { driver: 'Lewis Hamilton', time: '1:16.627', year: '2020' }
  },
  zandvoort: {
    winner: { driver: 'Oscar Piastri', constructor: 'McLaren', year: '2025' },
    fastestLap: { driver: 'Lewis Hamilton', time: '1:11.097', year: '2021' }
  },
  monza: {
    winner: { driver: 'Max Verstappen', constructor: 'Red Bull', year: '2025' },
    fastestLap: { driver: 'Lando Norris', time: '1:20.901', year: '2025' }
  },
  baku: {
    winner: { driver: 'Max Verstappen', constructor: 'Red Bull', year: '2025' },
    fastestLap: { driver: 'Charles Leclerc', time: '1:43.009', year: '2019' }
  },
  marina_bay: {
    winner: { driver: 'George Russell', constructor: 'Mercedes', year: '2025' },
    fastestLap: { driver: 'Lewis Hamilton', time: '1:33.808', year: '2025' }
  },
  americas: {
    winner: { driver: 'Max Verstappen', constructor: 'Red Bull', year: '2025' },
    fastestLap: { driver: 'Charles Leclerc', time: '1:36.169', year: '2019' }
  },
  rodriguez: {
    winner: { driver: 'Lando Norris', constructor: 'McLaren', year: '2025' },
    fastestLap: { driver: 'Valtteri Bottas', time: '1:17.774', year: '2021' }
  },
  interlagos: {
    winner: { driver: 'Lando Norris', constructor: 'McLaren', year: '2025' },
    fastestLap: { driver: 'Valtteri Bottas', time: '1:10.540', year: '2018' }
  },
  las_vegas: {
    winner: { driver: 'Michele Alboreto', constructor: 'Tyrrell', year: '1982' },
    fastestLap: { driver: 'Data unavailable', time: 'Data unavailable', year: 'Data unavailable' }
  },
  losail: {
    winner: { driver: 'Max Verstappen', constructor: 'Red Bull', year: '2025' },
    fastestLap: { driver: 'Lando Norris', time: '1:22.384', year: '2024' }
  },
  yas_marina: {
    winner: { driver: 'Max Verstappen', constructor: 'Red Bull', year: '2025' },
    fastestLap: { driver: 'Kevin Magnussen', time: '1:25.637', year: '2024' }
  },
};
