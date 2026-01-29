import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DataService, Investment, Transaction } from './data.service';

describe('DataService', () => {
  let service: DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DataService]
    });
    service = TestBed.inject(DataService);
    
    // Reset data to a known state before each test
    service.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#executeTransaction', () => {
    it('should throw an error if trying to buy with insufficient funds', () => {
      // Arrange: Attempt to buy an asset worth more than the initial cash balance
      const transaction = { ticker: 'AAPL', qty: 1000, price: 2000, type: 'BUY' as 'BUY' | 'SELL' };
      
      // Act & Assert
      expect(() => service.executeTransaction(transaction.ticker, transaction.qty, transaction.price, transaction.type))
        .toThrowError(/Saldo insuficiente/);
    });

    it('should throw an error if trying to sell more shares than owned', () => {
      // Arrange: Sell more AAPL shares than are in the initial seed data
      const transaction = { ticker: 'AAPL', qty: 100, price: 200, type: 'SELL' as 'BUY' | 'SELL' };
      
      // Act & Assert
      expect(() => service.executeTransaction(transaction.ticker, transaction.qty, transaction.price, transaction.type))
        .toThrowError(/No puedes vender/);
    });

    it('should correctly process a valid BUY transaction for an existing asset', () => {
      // Arrange
      const initialCash = service.mockData.cashBalance;
      const initialAsset = service.mockData.assets.find(a => a.ticker === 'AAPL')!;
      const initialQty = initialAsset.quantity;
      const buyQty = 5;
      const price = 200;

      // Act
      service.executeTransaction('AAPL', buyQty, price, 'BUY');

      // Assert
      const updatedAsset = service.mockData.assets.find(a => a.ticker === 'AAPL')!;
      expect(service.mockData.cashBalance).toBe(initialCash - (buyQty * price));
      expect(updatedAsset.quantity).toBe(initialQty + buyQty);
      expect(service.mockData.transactions[0].type).toBe('BUY');
    });

    it('should correctly process a valid SELL transaction', () => {
      // Arrange
      const initialCash = service.mockData.cashBalance;
      const sellQty = 5;
      const price = 200;

      // Act
      service.executeTransaction('AAPL', sellQty, price, 'SELL');

      // Assert
      const updatedAsset = service.mockData.assets.find(a => a.ticker === 'AAPL')!;
      expect(service.mockData.cashBalance).toBe(initialCash + (sellQty * price));
      expect(updatedAsset.quantity).toBe(10); // Initial 15 - 5 = 10
      expect(service.mockData.transactions[0].type).toBe('SELL');
    });

    it('should remove an asset if all shares are sold', () => {
      // Arrange: Sell all AAPL shares
      const initialAsset = service.mockData.assets.find(a => a.ticker === 'AAPL')!;
      const sellQty = initialAsset.quantity;

      // Act
      service.executeTransaction('AAPL', sellQty, 190, 'SELL');

      // Assert
      const assetAfterSale = service.mockData.assets.find(a => a.ticker === 'AAPL');
      expect(assetAfterSale).toBeUndefined();
    });
  });

  describe('#updateAssetPrices', () => {
    it('should update prices and recalculate metrics for provided assets', () => {
      // Arrange
      const initialAsset = { ...service.mockData.assets.find(a => a.ticker === 'AAPL')! };
      const newPrice = 200;
      const newPrices = [{ symbol: 'AAPL', price: newPrice }];

      // Act
      service.updateAssetPrices(newPrices);

      // Assert
      const updatedAsset = service.mockData.assets.find(a => a.ticker === 'AAPL')!;
      expect(updatedAsset.current_price).toBe(newPrice);
      expect(updatedAsset.marketValue).toBe(updatedAsset.quantity * newPrice);
      // Verify gainLoss is also updated, it should be different from initial
      const initialGainLoss = (initialAsset.current_price - initialAsset.avg_cost) * initialAsset.quantity;
      expect(updatedAsset.gainLoss).not.toBe(initialGainLoss);
    });

    it('should not change anything if no new prices are provided', () => {
      // Arrange
      const originalData = JSON.stringify(service.mockData);

      // Act
      service.updateAssetPrices([]);

      // Assert
      const newData = JSON.stringify(service.mockData);
      expect(newData).toEqual(originalData);
    });
  });
});
