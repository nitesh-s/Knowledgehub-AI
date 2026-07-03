from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from app.config import get_settings

settings = get_settings()


def setup_telemetry(app):
    if not settings.phoenix_collector_endpoint:
        return
    provider = TracerProvider()
    exporter = OTLPSpanExporter(endpoint=f"{settings.phoenix_collector_endpoint}/v1/traces")
    provider.add_span_processor(BatchSpanProcessor(exporter))
    trace.set_tracer_provider(provider)
    FastAPIInstrumentor.instrument_app(app)
