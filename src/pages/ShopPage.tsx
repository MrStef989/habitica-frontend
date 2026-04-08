import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { shopApi } from '../lib/api'
import { useAuthStore } from '../store/auth.store'
import { useToastStore } from '../store/toast.store'
import type { Item, InventoryItem } from '../types'
import './ShopPage.css'

const TYPE_ICONS: Record<string, string> = {
  weapon: '⚔', armor: '🛡', helmet: '◉', accessory: '◈', potion: '♦',
}

export function ShopPage() {
  const [tab, setTab] = useState<'shop' | 'inventory'>('shop')
  const { user, updateUser } = useAuthStore()
  const { add: addToast } = useToastStore()
  const qc = useQueryClient()

  const { data: items = [] } = useQuery<Item[]>({
    queryKey: ['shop-items'],
    queryFn: shopApi.items,
  })

  const { data: inventory = [] } = useQuery<InventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: shopApi.inventory,
  })

  const buyMut = useMutation({
    mutationFn: (itemId: string) => shopApi.buy(itemId),
    onSuccess: (_data, itemId) => {
      const item = items.find((i) => i.id === itemId)
      if (user && item) {
        updateUser({ ...user, gold: Math.max(0, user.gold - item.price) })
      }
      qc.invalidateQueries({ queryKey: ['inventory'] })
      qc.invalidateQueries({ queryKey: ['me'] })
      addToast('gold', `Purchased!`)
    },
    onError: (e: any) => addToast('error', e.response?.data?.message ?? 'Purchase failed'),
  })

  const equipMut = useMutation({
    mutationFn: (invId: string) => shopApi.equip(invId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
    onError: (e: any) => addToast('error', e.response?.data?.message ?? 'Error'),
  })

  const ownedIds = new Set(inventory.map((i) => i.itemId))

  return (
    <div className="shop-page fade-up">
      <div className="page-header">
        <div>
          <h2 className="page-title">Armory</h2>
          <p className="page-sub">Spend your gold on gear and potions</p>
        </div>
        {user && (
          <span className="stat-pill shop-gold">
            <span style={{ color: 'var(--gold)' }}>◈</span>
            {user.gold.toFixed(1)} gold
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="task-tabs" style={{ marginBottom: '1.5rem' }}>
        <button className={`task-tab ${tab === 'shop' ? 'active' : ''}`} onClick={() => setTab('shop')}>
          ◉ Shop
        </button>
        <button className={`task-tab ${tab === 'inventory' ? 'active' : ''}`} onClick={() => setTab('inventory')}>
          ◈ Inventory ({inventory.length})
        </button>
      </div>

      {/* Shop tab */}
      {tab === 'shop' && (
        <div className="shop-grid">
          {items.map((item) => {
            const owned = ownedIds.has(item.id) && item.type !== 'potion'
            const canAfford = user ? user.gold >= item.price : false
            return (
              <div key={item.id} className={`shop-card card ${owned ? 'shop-card--owned' : ''}`}>
                <div className="shop-card-icon">{TYPE_ICONS[item.type] ?? '◎'}</div>
                <div className="shop-card-body">
                  <div className="shop-card-header">
                    <h4 className="shop-item-name">{item.name}</h4>
                    <span className="shop-item-type badge"
                      style={{ background: 'rgba(232,160,48,0.1)', color: 'var(--gold)', border: '1px solid var(--gold-dim)' }}>
                      {item.type}
                    </span>
                  </div>
                  <p className="shop-item-desc">{item.description}</p>

                  {/* Stat bonuses */}
                  <div className="shop-stats">
                    {item.strBonus > 0 && (
                      <span className="shop-stat shop-stat--str">STR +{item.strBonus}</span>
                    )}
                    {item.conBonus > 0 && (
                      <span className="shop-stat shop-stat--con">CON +{item.conBonus}</span>
                    )}
                  </div>

                  <div className="shop-card-footer">
                    <span className="shop-price">
                      <span style={{ color: 'var(--gold)' }}>◈</span> {item.price}
                    </span>
                    {owned ? (
                      <span className="badge badge-easy">Owned</span>
                    ) : (
                      <button
                        className="btn btn-gold shop-buy-btn"
                        disabled={!canAfford || buyMut.isPending}
                        onClick={() => buyMut.mutate(item.id)}
                      >
                        {canAfford ? 'Buy' : 'Too poor'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Inventory tab */}
      {tab === 'inventory' && (
        inventory.length === 0 ? (
          <div className="tasks-empty">
            <span className="tasks-empty-icon">◎</span>
            <p>Your inventory is empty. Visit the shop!</p>
          </div>
        ) : (
          <div className="shop-grid">
            {inventory.map((inv) => (
              <div key={inv.id} className={`shop-card card ${inv.equipped ? 'shop-card--equipped' : ''}`}>
                <div className="shop-card-icon">{TYPE_ICONS[inv.item.type] ?? '◎'}</div>
                <div className="shop-card-body">
                  <div className="shop-card-header">
                    <h4 className="shop-item-name">{inv.item.name}</h4>
                    {inv.equipped && (
                      <span className="badge" style={{ background: 'rgba(232,160,48,0.2)', color: 'var(--gold)', border: '1px solid var(--gold)' }}>
                        Equipped
                      </span>
                    )}
                  </div>
                  <p className="shop-item-desc">{inv.item.description}</p>

                  <div className="shop-stats">
                    {inv.item.strBonus > 0 && <span className="shop-stat shop-stat--str">STR +{inv.item.strBonus}</span>}
                    {inv.item.conBonus > 0 && <span className="shop-stat shop-stat--con">CON +{inv.item.conBonus}</span>}
                  </div>

                  {inv.item.type !== 'potion' && (
                    <div className="shop-card-footer">
                      <span className="shop-item-type badge"
                        style={{ background: 'rgba(232,160,48,0.1)', color: 'var(--gold-dim)', border: '1px solid var(--gold-dim)' }}>
                        {inv.item.type}
                      </span>
                      <button
                        className={`btn ${inv.equipped ? 'btn-danger' : 'btn-gold'} shop-buy-btn`}
                        onClick={() => equipMut.mutate(inv.id)}
                        disabled={equipMut.isPending}
                      >
                        {inv.equipped ? 'Unequip' : 'Equip'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
