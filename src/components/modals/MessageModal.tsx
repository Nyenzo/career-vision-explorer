import React, { useState } from 'react';
import { Modal, Button, Input, Select, Textarea } from '@components/ui';

interface ServiceTier {
  name: string;
  description: string;
  price: number;
}

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceTiers: ServiceTier[];
  onSendMessage: (tier: ServiceTier | null, message: string) => void;
}

export const MessageModal: React.FC<MessageModalProps> = ({ isOpen, onClose, serviceTiers, onSendMessage }) => {
  const [selectedTier, setSelectedTier] = useState<ServiceTier | null>(null);
  const [message, setMessage] = useState('');

  const handleSend = () => {
    onSendMessage(selectedTier, message);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send a Message">
      <div className="space-y-4">
        <Select 
          label="Select a service tier (optional)"
          value={selectedTier ? selectedTier.name : ''}
          onChange={(e) => setSelectedTier(serviceTiers.find(tier => tier.name === e.target.value) || null)}
        >
          {serviceTiers.map((tier) => (
            <option key={tier.name} value={tier.name}>
              {tier.name} - {tier.description} - ${tier.price}
            </option>
          ))}
        </Select>

        <Textarea
          label="Message"
          placeholder="Describe your project requirements..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <Button onClick={handleSend} disabled={!message.trim()}>
          Send Message
        </Button>
      </div>
    </Modal>
  );
};
