from locust import HttpUser, task, between

class CampMondoUser(HttpUser):
    wait_time = between(1, 2)

    def on_start(self):
        res = self.client.post("/api/auth/login", json={
            "email": "admin@campmondo.com",
            "password": "YourPassword123"
        })
        token = res.json().get("access_token", "")
        self.headers = {"Authorization": f"Bearer {token}"}

    @task(3)
    def get_sessions(self):
        self.client.get("/api/admin/sessions", headers=self.headers)

    @task(2)
    def get_payments(self):
        self.client.get("/api/admin/payments", headers=self.headers)

    @task(1)
    def get_reports(self):
        self.client.get("/api/admin/reports/attendance", headers=self.headers)