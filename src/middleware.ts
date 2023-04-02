import withAuth from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      return !!(
        token ||
        req.cookies.get("__Secure-next-auth.session-token") ||
        req.cookies.get("next-auth.session-token")
      );
    },
  },
});

export const config = {
  matcher: ["/", "/((?!api|_next/static|_next/image|favicon.ico|signin|en).*)"],
};
