import { accountDetailsRoute } from "../router";

export function AccountDetails() {
  const params = accountDetailsRoute.useParams();
  return <div>{params.username} Account Details Page</div>;
}
