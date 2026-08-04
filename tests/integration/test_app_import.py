from app.main import add


def test_app_module_is_runnable():
    assert add(2, 3) == 5
