import { useState } from 'react';
import Modal, { ModalHeader, ModalBody } from '../ui/Modal';
import Button from '../ui/Button';

export default function WhatsAppModal({ open, onClose, data }) {
    const [copied, setCopied] = useState(false);

    if (!data) return null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(data.whatsapp_message);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* fallback ignored */ }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <ModalHeader onClose={onClose}>
                <span className="text-lg">💬</span>
                <div>
                    <h2 className="text-base font-bold text-text-primary">WhatsApp Message</h2>
                    <p className="text-[11px] text-text-muted">For {data.lead_name} — {data.category}</p>
                </div>
            </ModalHeader>

            <ModalBody className="space-y-4">
                {/* Chat bubble */}
                <div className="relative p-4 bg-[#005c4b]/60 rounded-2xl rounded-tl-sm
          border border-emerald-800/30 text-sm text-emerald-50 leading-relaxed whitespace-pre-wrap">
                    {data.whatsapp_message}
                    {/* Tail */}
                    <div className="absolute -left-1.5 top-0 w-3 h-3 bg-[#005c4b]/60 rotate-45
            border-l border-b border-emerald-800/30" />
                </div>

                <div className="flex gap-3">
                    <Button variant="success" className="flex-1" onClick={handleCopy}>
                        {copied ? '✓ Copied!' : '📋 Copy Message'}
                    </Button>
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                </div>
            </ModalBody>
        </Modal>
    );
}
