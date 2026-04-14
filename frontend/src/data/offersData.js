/**
 * Nobita Café — Offers Data
 */
import offerImg from '@/assets/offers/offer.jpeg'
import heroBg1 from '@/assets/hero/bg (1).jpeg'
import heroBg2 from '@/assets/hero/bg (2).jpeg'

export const OFFERS = [
  {
    id: 1,
    img: offerImg,
    title: '20% Off Filter Kaapi',
    subtitle: 'Today only — 7AM to 10AM',
    badge: 'Morning Deal',
    gradient: 'from-amber-600 to-orange-500',
  },
  {
    id: 2,
    img: heroBg1,
    title: 'Buy 2 Get 1 Free',
    subtitle: 'All Cold Brews this weekend',
    badge: 'Weekend Special',
    gradient: 'from-emerald-600 to-teal-500',
  },
  {
    id: 3,
    img: heroBg2,
    title: 'Free Brownie',
    subtitle: 'On orders above ₹400',
    badge: 'Combo Offer',
    gradient: 'from-purple-600 to-pink-500',
  },
]

export default OFFERS
