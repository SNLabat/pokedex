import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';

const WonderCardViewer = () => {
  const [wcData, setWcData] = useState(null);
  const [error, setError] = useState(null);

  const parseWC67Data = (buf) => {
    // Basic structure for parsing - would need to implement full parsing logic
    const data = {
      wcId: buf.readUInt16LE(0x00),
      wcTitle: buf.toString('utf16le', 0x02, 0x4B).replace(/\0/g, ''),
      cardType: ['Pokemon', 'Item'][buf.readUInt8(0x51)],
      // Add more parsing as needed
    };
    return data;
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if file is a wondercard by extension
    if (!file.name.match(/\.(wc[67]|wc[67]full|pgf|pcd|pgt)$/i)) {
      setError('Please upload a valid wondercard file');
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      const data = parseWC67Data(uint8Array);
      setWcData(data);
      setError(null);
    } catch (err) {
      setError('Error parsing wondercard file');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-red-600 h-16 flex items-center justify-center shadow-lg">
        <h1 className="text-4xl font-bold">Wondercard Viewer</h1>
      </div>

      <div className="container mx-auto p-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Upload Wondercard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer hover:border-red-500">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">WC6, WC7, PGF, PCD, PGT files supported</p>
                </div>
                <input 
                  type="file" 
                  className="hidden"
                  accept=".wc6,.wc7,.wc6full,.wc7full,.pgf,.pcd,.pgt"
                  onChange={handleFileUpload} 
                />
              </label>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-900/50 text-red-200 rounded-lg">
                {error}
              </div>
            )}

            {wcData && (
              <div className="mt-8 p-6 bg-gray-700 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">{wcData.wcTitle}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400">Wondercard ID</p>
                    <p className="text-xl">{wcData.wcId}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Type</p>
                    <p className="text-xl">{wcData.cardType}</p>
                  </div>
                  {/* Add more wondercard data display here */}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WonderCardViewer;