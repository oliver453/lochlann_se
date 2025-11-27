"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FaTimes, FaCamera } from "react-icons/fa";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

interface ScannerModalProps {
  authToken: string;
  onClose: () => void;
  onCodeUsed: () => void;
}

export default function ScannerModal({
  authToken,
  onClose,
  onCodeUsed,
}: ScannerModalProps) {
  const [scanCode, setScanCode] = useState("");
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);

  // Stäng kameran när komponenten unmountas
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const verifyCode = async (code: string) => {
    if (isVerifying) return;
    setIsVerifying(true);
    setVerifyResult(null);

    try {
      const response = await fetch(`/api/offer/verify?code=${code}`);
      const data = await response.json();
      setVerifyResult(data);
    } catch (error) {
      console.error("Verify error:", error);
      setVerifyResult({ valid: false, message: "Ett fel uppstod" });
    } finally {
      setIsVerifying(false);
    }
  };

  const markAsUsed = async () => {
    if (!scanCode || !verifyResult?.valid) return;

    try {
      const response = await fetch("/api/offer/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ code: scanCode }),
      });

      if (response.ok) {
        setVerifyResult({
          ...verifyResult,
          valid: false,
          reason: "already_used",
          message: "Koden har markerats som använd",
        });
        onCodeUsed();
      }
    } catch (error) {
      console.error("Mark as used error:", error);
    }
  };

  const handleScanCode = () => {
    if (scanCode.trim()) {
      verifyCode(scanCode.trim().toUpperCase());
    }
  };

  const startCamera = async () => {
    try {
      setCameraError("");
      hasScannedRef.current = false;
      setUseCamera(true);

      await new Promise((resolve) => setTimeout(resolve, 200));

      const element = document.getElementById("qr-reader");
      if (!element) throw new Error("QR reader element saknas");

      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;
      setIsCameraActive(true);

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 5, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          if (hasScannedRef.current) return;
          hasScannedRef.current = true;

          await stopCamera();

          try {
            const url = new URL(decodedText);
            const code = url.searchParams.get("code");
            if (code) {
              setScanCode(code.toUpperCase());
              verifyCode(code.toUpperCase());
              return;
            }
          } catch {
            // Inte en URL
          }

          setScanCode(decodedText.toUpperCase());
          verifyCode(decodedText.toUpperCase());
        },
        () => {}
      );
    } catch (error: any) {
      console.error("Camera error:", error);
      const msg = error?.message || String(error);

      if (msg.includes("Permission denied") || msg.includes("NotAllowedError")) {
        setCameraError("Kameraåtkomst nekad. Tillåt kameraåtkomst i din webbläsare.");
      } else if (msg.includes("NotFoundError") || msg.includes("not found")) {
        setCameraError("Ingen kamera hittades. Kontrollera att din enhet har en kamera.");
      } else if (msg.includes("NotReadableError")) {
        setCameraError("Kameran används redan av en annan app.");
      } else {
        setCameraError("Kunde inte starta kameran. Prova att ange koden manuellt istället.");
      }

      setIsCameraActive(false);
      setUseCamera(false);
    }
  };

  const stopCamera = async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;

    try {
      const state = (scanner as any).getState?.();
      if (
        state === Html5QrcodeScannerState.SCANNING ||
        state === Html5QrcodeScannerState.PAUSED
      ) {
        await scanner.stop();
      }
      await scanner.clear();
    } catch (error: any) {
      if (!String(error?.message || error).includes("scanner is not running")) {
        console.warn("Stop camera warning:", error);
      }
    } finally {
      scannerRef.current = null;
      setIsCameraActive(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  // Stäng på ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="bg-gray-900 rounded-lg p-6 lg:p-8 max-w-md w-full relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <FaTimes size={24} />
        </button>

        <h2 className="text-xl lg:text-2xl font-rustic uppercase text-white mb-6 text-center">
          Skanna eller ange kod
        </h2>

        {!useCamera ? (
          <div className="space-y-4 mb-6">
            <Button
              onClick={startCamera}
              className="w-full bg-white text-black hover:bg-gray-200 py-6 flex items-center justify-center gap-3"
            >
              <FaCamera size={20} />
              Öppna kamera
            </Button>

            {cameraError && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-300 text-sm">{cameraError}</p>
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">eller</span>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2 text-sm">
                Ange kod manuellt:
              </label>
              <input
                type="text"
                value={scanCode}
                onChange={(e) => setScanCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleScanCode()}
                placeholder="A1B2C3D4"
                className="w-full px-4 py-3 bg-black text-white border border-gray-700 rounded-lg focus:outline-none focus:border-gray-500 font-mono text-center text-xl tracking-widest"
                maxLength={8}
              />
            </div>

            <Button
              onClick={handleScanCode}
              disabled={!scanCode.trim() || isVerifying}
              className="w-full bg-gray-700 text-white hover:bg-gray-600"
            >
              {isVerifying ? "Verifierar..." : "Verifiera kod"}
            </Button>
          </div>
        ) : (
          <div className="mb-6">
            <div
              id="qr-reader"
              className="relative bg-black rounded-lg overflow-hidden w-full max-w-md mx-auto"
            >
              {/* Overlay för visuell feedback */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-2 border-green-400 rounded-lg relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>
                </div>
              </div>
            </div>

            <p className="text-center text-gray-400 text-sm mt-4">
              Rikta kameran mot QR-koden
            </p>

            <Button
              onClick={stopCamera}
              variant="outline"
              className="w-full mt-4 border-gray-700 text-gray-300"
            >
              Avbryt kamera
            </Button>
          </div>
        )}

        {verifyResult && (
          <div
            className={`p-4 rounded-lg ${
              verifyResult.valid
                ? "bg-green-900/20 border border-green-500/30"
                : "bg-red-900/20 border border-red-500/30"
            }`}
          >
            {verifyResult.valid ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    className="w-5 h-5 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-green-300 font-bold">Giltig kod</p>
                </div>
                <p className="text-green-200 text-sm mb-3">
                  Telefonnummer: {verifyResult.phoneNumber}
                </p>
                <Button
                  onClick={markAsUsed}
                  className="w-full bg-white text-black hover:bg-gray-200"
                >
                  Markera som använd
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    className="w-5 h-5 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-red-300 font-bold">{verifyResult.message}</p>
                </div>
                {verifyResult.reason === "already_used" && verifyResult.usedAt && (
                  <p className="text-red-200 text-sm">
                    Använd: {new Date(verifyResult.usedAt).toLocaleString("sv-SE")}
                  </p>
                )}
                {verifyResult.reason === "expired" && verifyResult.expiresAt && (
                  <p className="text-red-200 text-sm">
                    Utgick: {new Date(verifyResult.expiresAt).toLocaleDateString("sv-SE")}
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
