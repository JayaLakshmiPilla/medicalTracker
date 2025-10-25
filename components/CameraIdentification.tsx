'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Tesseract from 'tesseract.js';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CameraIcon } from '@heroicons/react/24/solid';

interface IdentifiedMedication {
  id: string;
  name: string;
  dosage: string;
  uses: string;
  sideEffects: string;
  timing: string;
}

export default function CameraIdentification() {
  const [medication, setMedication] = useState<IdentifiedMedication | null>(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<any>(null);

  // ✅ Start QR Scanner using html5-qrcode
  const startScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
    }

    const html5QrCode = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: 250 },
      false
    );

    html5QrCode.render(
      (decodedText: string) => {
        setScanning(false);
        toast.success(`QR Code detected: ${decodedText}`);
        html5QrCode.clear();
        // You can process the decodedText here if it contains medicine info
      },
      (errorMessage) => {
        console.warn('QR scanning error', errorMessage);
      }
    );

    scannerRef.current = html5QrCode;
    setScanning(true);
  };

  // ✅ Use Tesseract for image OCR (Medicine Label)
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    toast.info('Analyzing image... please wait.');

    try {
      const result = await Tesseract.recognize(file, 'eng');
      const text = result.data.text.toLowerCase();

      // 🧠 Example dummy identification logic
      const identified: IdentifiedMedication = {
        id: Date.now().toString(),
        name: text.includes('paracetamol') ? 'Paracetamol' : 'Unknown Tablet',
        dosage: '500mg',
        uses: 'Fever, mild pain relief',
        sideEffects: 'Nausea, dizziness (rare)',
        timing: '1 tablet every 6 hours after food',
      };

      setMedication(identified);
      toast.success('Medicine identified successfully!');
    } catch (error) {
      toast.error('Error identifying medicine.');
      console.error(error);
    }
  };

  // ✅ Stop scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <ToastContainer />
      <motion.h1
        className="text-3xl font-bold mb-6 text-blue-600"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        Medicine Identification via Camera
      </motion.h1>

      {/* 📸 QR Scanner Section */}
      <div className="mb-6 text-center">
        {!scanning ? (
          <button
            onClick={startScanner}
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 shadow"
          >
            <CameraIcon className="w-5 h-5" /> Start QR Scan
          </button>
        ) : (
          <p className="text-green-600 font-semibold">Scanning... Point your camera at the QR code</p>
        )}
      </div>

      <div id="qr-reader" className="w-72 h-72 border rounded-lg shadow-md"></div>

      {/* 🧾 OCR Image Upload */}
      <div className="mt-8 text-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="border p-2 rounded-lg"
        />
        <p className="text-sm text-gray-500 mt-2">or upload medicine label image</p>
      </div>

      {/* 💊 Identified Medicine Info */}
      {medication && (
        <motion.div
          className="mt-8 p-5 bg-white rounded-2xl shadow-lg w-full max-w-md text-left"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="text-xl font-semibold text-blue-600 mb-2">{medication.name}</h2>
          <p><strong>Dosage:</strong> {medication.dosage}</p>
          <p><strong>Uses:</strong> {medication.uses}</p>
          <p><strong>Side Effects:</strong> {medication.sideEffects}</p>
          <p><strong>Timing:</strong> {medication.timing}</p>
        </motion.div>
      )}
    </div>
  );
}
