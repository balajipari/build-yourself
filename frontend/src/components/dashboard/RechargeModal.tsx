import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { BsStars } from 'react-icons/bs';
import { paymentService } from '../../services/payment';

// Bind modal to your appElement for accessibility
Modal.setAppElement('#root');

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecharge: (packageId: string, currencyCode: string) => void;
}

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  rate_to_usd: number;
}

interface CreditPackage {
  id: string;
  credits: number;
  base_price_usd: number;
}

interface PackagePrice {
  currency_code: string;
  currency_symbol: string;
  amount: number;
  credits: number;
}

export const RechargeModal: React.FC<RechargeModalProps> = ({
  isOpen,
  onClose,
  onRecharge,
}) => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('INR');
  const [packagePrices, setPackagePrices] = useState<Record<string, PackagePrice>>({});
  const [isLoading, setIsLoading] = useState(true);



  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [currencyData, packageData] = await Promise.all([
          paymentService.getCurrencies(),
          paymentService.getCreditPackages()
        ]);
        setCurrencies(currencyData);
        setPackages(packageData);
        if (packageData.length > 0) {
          setSelectedPackage(packageData[0].id);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    const updatePrices = async () => {
      if (!selectedPackage || !selectedCurrency) return;
      
      try {
        const price = await paymentService.getPackagePrice(selectedPackage, selectedCurrency);
        setPackagePrices(prev => ({
          ...prev,
          [selectedPackage]: price
        }));
      } catch (error) {
        console.error('Error fetching price:', error);
      }
    };

    updatePrices();
  }, [selectedPackage, selectedCurrency]);

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCurrency(e.target.value);
  };

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId);
  };

  const handleProceedToPay = () => {
    if (!selectedPackage) return;
    onRecharge(selectedPackage, selectedCurrency);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => {
        onClose();
      }}
      className="w-full max-w-md rounded-2xl bg-white p-6 text-left shadow-xl absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 outline-none transition-opacity duration-200"
      overlayClassName="fixed inset-0 bg-black/30 flex items-center justify-center p-4 transition-opacity duration-200"
      closeTimeoutMS={200}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <BsStars className="text-orange-500 text-xl" />
        <h3 className="text-lg font-medium text-gray-900">
          Recharge Credits
        </h3>
      </div>

      {/* Credit options */}
                {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Currency</label>
                <select
                  value={selectedCurrency}
                  onChange={handleCurrencyChange}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.name} ({currency.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {packages.map((pkg) => {
                  const price = packagePrices[pkg.id];
                  return (
                    <button
                      key={pkg.id}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        selectedPackage === pkg.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-200'
                      }`}
                      onClick={() => handlePackageSelect(pkg.id)}
                    >
                      <div className="text-lg font-semibold text-gray-900">
                        {pkg.credits} Credits
                      </div>
                      <div className="text-sm text-gray-500">
                        {price ? `${price.currency_symbol}${price.amount}` : '...'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

      {/* Action buttons */}
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          className="flex-1 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                              onClick={handleProceedToPay}
        >
          Proceed to Pay
        </button>
        <button
          type="button"
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};
