import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export function useCSVData<T>(filename: string): T[] | null {
  const [data, setData] = useState<T[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`./data/${filename}`);
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setData(results.data as T[]);
          },
          error: (error: Error) => {
            console.error('Error parsing CSV:', error);
          }
        });
      } catch (error) {
        console.error('Error fetching CSV:', error);
      }
    };

    fetchData();
  }, [filename]);

  return data;
}


