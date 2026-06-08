const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/user/Profile.jsx', 'utf8');
const oldStr = `  const [orders, setOrders] = useState([]);`;
const newStr = `  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderItems, setOrderItems] = useState({});

  const toggleOrderDetails = async (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(orderId);

    if (!orderItems[orderId]) {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrderItems(prev => (; ...prev, [orderId]: res.data.items }));
      } catch (error) {
        console.error("Lá»—i láº¥y chi tiáº½t Ä‘Æ¡n!‹\œ›ÜŠNÂˆBˆBˆNØÂ˜ÛÙHHÛÙKœ™\XÙJÛİ‹™]ÔİŠNÂ™œËÜš]Qš[TŞ[˜Ê	Ùœ›Û[™ÜÜ˜ËÜYÙ\Ëİ\Ù\‹Ô›Ùš[KšœŞ	ËÛÙJN