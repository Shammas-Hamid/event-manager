import { QRCodeCanvas } from 'qrcode.react';

export function ParticipantQR({ participantId }) {
  return (
    <div className="flex flex-col items-center p-4">
      <QRCodeCanvas value={participantId} size={200} level="H" />
      <p className="mt-2 text-sm text-gray-500 font-mono">{participantId}</p>
    </div>
  );
}