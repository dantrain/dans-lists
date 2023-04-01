import withAuth from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req }) => {
      const token = req.cookies.get("next-auth.session-token");
      return !!token;
    },
  },
});

export const config = {
  matcher: ["/", "/((?!api|_next/static|_next/image|favicon.ico|signin).*)"],
};
