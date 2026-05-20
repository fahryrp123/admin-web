import { createBrowserRouter } from "react-router";
import { Splash } from "./pages/Splash";
import { Onboarding } from "./pages/Onboarding";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { HomeEnhanced } from "./pages/HomeEnhanced";
import { CarFleet } from "./pages/CarFleet";
import { CarDetail } from "./pages/CarDetail";
import { CarDetailEnhanced } from "./pages/CarDetailEnhanced";
import { Booking } from "./pages/Booking";
import { Checkout } from "./pages/Checkout";
import { CheckoutSuccess } from "./pages/CheckoutSuccess";
import { Payment } from "./pages/Payment";
import { PaymentSuccess } from "./pages/PaymentSuccess";
import { RentalStatus } from "./pages/RentalStatus";
import { MapTracking } from "./pages/MapTracking";
import { RentalHistory } from "./pages/RentalHistory";
import { Profile } from "./pages/Profile";
import { ChatAdmin } from "./pages/ChatAdmin";
import { BookingManagement } from "./pages/BookingManagement";
import { MainLayout } from "./components/MainLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Splash,
  },
  {
    path: "/onboarding",
    Component: Onboarding,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/signup",
    Component: Signup,
  },
  {
    path: "/checkout/:id",
    Component: Checkout,
  },
  {
    path: "/payment",
    Component: Payment,
  },
  {
    path: "/payment-success",
    Component: PaymentSuccess,
  },
  {
    path: "/checkout-success",
    Component: CheckoutSuccess,
  },
  {
    path: "/map-tracking",
    Component: MapTracking,
  },
  {
    path: "/chat-admin",
    Component: ChatAdmin,
  },
  {
    path: "/home",
    Component: MainLayout,
    children: [
      { index: true, Component: HomeEnhanced },
      { path: "fleet", Component: CarFleet },
      { path: "car/:id", Component: CarDetailEnhanced },
      { path: "booking/:id", Component: Booking },
      { path: "bookings", Component: BookingManagement },
      { path: "rentals", Component: RentalStatus },
      { path: "history", Component: RentalHistory },
      { path: "profile", Component: Profile },
    ],
  },
]);
