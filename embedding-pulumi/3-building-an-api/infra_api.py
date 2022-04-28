import json
import os.path
import falcon
from wsgiref.simple_server import make_server
from infra import basic as infra

api = application = falcon.App()
api_path = os.path.abspath("api")


def spin_up_program(requested):
    context = infra.set_context(
        org='<org>',
        project='burner-program-2',
        stackd='dev',
        dirname=f'{api_path}',
        req=f'{requested}'
    )
    infra.spin_venv(context['dirname'])
    stack = infra.set_stack(context_var=context)
    infra.configure_project(stackd=stack, context_var=context)
    infra.refresh_stack(stackd=stack)
    results = infra.update_stack(stackd=stack)
    infra.destroy_stack(stackd=stack, destroy=True)
    return results


# Home resource
class Home(object):
    def on_get(self, req, resp):
        payload = {
            "response": "OK"
        }
        resp.text = json.dumps(payload)
        resp.status = falcon.HTTP_200


# Check things resource
class Checker(object):
    def on_get(self, req, resp):
        payload = {
            "response": "hello, world"
        }
        resp.text = json.dumps(payload)
        resp.status = falcon.HTTP_200

    def on_get_time(self, req, resp):
        time_zone = spin_up_program('timezone')
        payload = {
            'response': f'{time_zone}'
        }
        resp.text = json.dumps(payload)
        resp.status = falcon.HTTP_200

    def on_get_location(self, req, resp):
        location = spin_up_program('location')
        payload = {
            'response': f'{location}'
        }
        resp.text = json.dumps(payload)
        resp.status = falcon.HTTP_200

    def on_get_weather(self, req, resp):
        pass


# Instantiation
home = Home()
checker = Checker()

# Routes
api.add_route('/', home)
api.add_route('/weather', checker, suffix='weather')
api.add_route('/time', checker, suffix='time')
api.add_route('/location', checker, suffix='location')


if __name__ == '__main__':
    with make_server('', 8000, api) as httpd:
        print('Serving on port 8000...')
        # Serve until process is killed
        httpd.serve_forever()
