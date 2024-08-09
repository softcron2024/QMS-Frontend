import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import '../charts/Chart.css';

const ChartOne = ({ thisWeekData, thisMonthData, thisYearData }) => {
  const [series, setSeries] = useState([
    {
      name: 'Generated',
      data: [],
    },
    {
      name: 'Scanned',
      data: [],
    },
  ]);
  const [view, setView] = useState('week');
  const [categories, setCategories] = useState([]);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    let updatedSeries;
    if (thisWeekData && view === 'week') {
      updatedSeries = series.map((serie) => {
        if (serie.name === 'Generated') {
          return { ...serie, data: thisWeekData.map(item => item.today_tokens_count) };
        }
        if (serie.name === 'Scanned') {
          return { ...serie, data: thisWeekData.map(item => item.today_scanned_tokens) };
        }
        return serie;
      });
      setSeries(updatedSeries);

      const newCategories = thisWeekData.map(item => {
        const date = new Date(item.report_date);
        const day = dayNames[date.getDay()];
        return day;
      });
      setCategories(newCategories);
    }
  }, [thisWeekData, dayNames, series, view]);

  useEffect(() => {
    let updatedSeries;
    if (thisMonthData && view === 'month') {
      updatedSeries = series.map((serie) => {
        if (serie.name === 'Generated') {
          return { ...serie, data: thisMonthData.map(item => item.today_tokens_count).slice(0, 30) };
        }
        if (serie.name === 'Scanned') {
          return { ...serie, data: thisMonthData.map(item => item.today_scanned_tokens).slice(0, 30) };
        }
        return serie;
      });
      setSeries(updatedSeries);

      const newCategories = thisMonthData.map(item => {
        const date = new Date(item.report_date);
        const day = date.getUTCDate();
        return day;
      }).slice(0, 30);
      setCategories(newCategories);
    }
  }, [thisMonthData, series, view]);

  useEffect(() => {
    if (thisYearData && view === 'year') {
      const updatedSeries = series.map((serie) => {
        if (serie.name === 'Generated') {
          return { ...serie, data: thisYearData.map(item => item.today_tokens_count).slice(0, 12) };
        }
        if (serie.name === 'Scanned') {
          return { ...serie, data: thisYearData.map(item => item.today_scanned_tokens).slice(0, 12) };
        }
        return serie;
      });
      setSeries(updatedSeries);

      const newCategories = [];
      thisYearData.forEach(item => {
        const monthIndex = item.report_month - 1; // Adjusting month to zero-based index
        const monthName = monthNames[monthIndex];
        newCategories.push(monthName);
      });

      const finalCategories = newCategories.slice(0, 12);
      setCategories(finalCategories);
    }
  }, [thisYearData, monthNames, series, view]);

  const allData = series.flatMap(serie => serie.data);
  const maxYValue = Math.max(...allData) > 100 ? Math.max(...allData) + 10 : 100;
  const minYValue = Math.min(...allData) < 0 ? Math.min(...allData) - 10 : 0;

  const options = {
    legend: {
      show: false,
      position: 'top',
      horizontalAlign: 'left',
    },
    colors: ['#3C50E0', '#80CAEE'],
    chart: {
      fontFamily: 'Satoshi, sans-serif',
      height: 335,
      type: 'area',
      dropShadow: {
        enabled: true,
        color: '#623CEA14',
        top: 10,
        blur: 4,
        left: 0,
        opacity: 0.1,
      },
      toolbar: {
        show: false,
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
          },
        },
      },
      {
        breakpoint: 1366,
        options: {
          chart: {
            height: 350,
          },
        },
      },
    ],
    stroke: {
      width: [2, 2],
      curve: 'straight',
    },
    grid: {
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 4,
      colors: '#fff',
      strokeColors: ['#3056D3', '#80CAEE'],
      strokeWidth: 3,
      strokeOpacity: 0.9,
      strokeDashArray: 0,
      fillOpacity: 1,
      discrete: [],
      hover: {
        size: undefined,
        sizeOffset: 5,
      },
    },
    xaxis: {
      type: 'category',
      categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        style: {
          fontSize: '0px',
        },
      },
      min: minYValue,
      max: maxYValue,
    },
  };

  return (
    <div className="main_chart_one">
      <div className="chart_date">
        <div className="chart_select">
          <div className="chart_Select_day">
            <button className="chart_Select_day" onClick={() => setView('week')}>Week</button>
            <button className="chart_Select_week" onClick={() => setView('month')}>Month</button>
            <button className="chart_Select_month" onClick={() => setView('year')}>Year</button>
          </div>
        </div>
      </div>

      <div>
        <div id="chartOne" className="Chart">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={250}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartOne;
